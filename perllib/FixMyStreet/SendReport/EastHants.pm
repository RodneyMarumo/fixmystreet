package FixMyStreet::SendReport::Email;

use Error qw(:try);
use Encode;
use mySociety::Web qw(ent);
use EastHantsWSDL;

my %councils = ();
my @to;

sub reset {
    %councils = ();
    @to = ();
}

sub add_council {
    my $council = shift;
    my $name = shift;

    $councils{ $council } = $name;
}

sub construct_message {
    my %h = @_;
    my $message = '';
    $message .= "[ This report was also sent to the district council covering the location of the problem, as the user did not categorise it; please ignore if you're not the correct council to deal with the issue. ]\n\n"
        if $h{multiple};
    $message .= <<EOF;
Subject: $h{title}

Details: $h{detail}

$h{fuzzy}, or to provide an update on the problem, please visit the following link:

$h{url}

$h{closest_address}
EOF
    return $message;
}

sub send {
    return if mySociety::Config::get('STAGING_SITE');

    my ( $row, $h, $to, $template, $recips, $nomail ) = @_;

    $h->{category} = 'Customer Services' if $h->{category} eq 'Other';
    $h->{message} = construct_message( %$h );
    my $return = 1;
    $eh_service ||= EastHantsWSDL->on_fault(sub { my($soap, $res) = @_; die ref $res ? $res->faultstring : $soap->transport->status, "\n"; });
    try {
        # ServiceName, RemoteCreatedBy, Salutation, FirstName, Name, Email, Telephone, HouseNoName, Street, Town, County, Country, Postcode, Comments, FurtherInfo, ImageURL
        my $message = ent(encode_utf8($h->{message}));
        my $name = ent(encode_utf8($h->{name}));
        my $result = $eh_service->INPUTFEEDBACK(
            $h->{category}, 'FixMyStreet', '', '', $name, $h->{email}, $h->{phone},
            '', '', '', '', '', '', $message, 'Yes', $h->{image_url}
        );
        $return = 0 if $result eq 'Report received';
    } otherwise {
        my $e = shift;
        print "Caught an error: $e\n";
    };
    return $return;
}

1;
